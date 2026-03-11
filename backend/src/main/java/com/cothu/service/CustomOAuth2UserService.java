package com.cothu.service;

import com.cothu.model.User;
import com.cothu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(request);
        String registrationId = request.getClientRegistration().getRegistrationId();

        return processOAuth2User(registrationId, oAuth2User);
    }

    private OAuth2User processOAuth2User(String registrationId, OAuth2User oAuth2User) {
        User.AuthProvider provider = User.AuthProvider.valueOf(registrationId.toUpperCase());
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String providerId;
        String email;
        String name;
        String avatarUrl;

        switch (provider) {
            case GOOGLE -> {
                providerId = (String) attributes.get("sub");
                email = (String) attributes.get("email");
                name = (String) attributes.get("name");
                avatarUrl = (String) attributes.get("picture");
            }
            case FACEBOOK -> {
                providerId = (String) attributes.get("id");
                email = (String) attributes.get("email");
                name = (String) attributes.get("name");
                @SuppressWarnings("unchecked")
                Map<String, Object> pictureData = (Map<String, Object>) attributes.get("picture");
                if (pictureData != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) pictureData.get("data");
                    avatarUrl = data != null ? (String) data.get("url") : null;
                } else {
                    avatarUrl = null;
                }
            }
            default -> throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        }

        // Use providerId-based email fallback for Facebook users who don't share email
        if (email == null || email.isBlank()) {
            email = providerId + "@" + provider.name().toLowerCase() + ".user";
        }

        // Find or create user
        final String finalEmail = email;
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> userRepository.findByEmail(finalEmail).orElse(null));

        if (user == null) {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .avatarUrl(avatarUrl)
                    .provider(provider)
                    .providerId(providerId)
                    .build();
        } else {
            user.setName(name);
            user.setAvatarUrl(avatarUrl);
        }

        userRepository.save(user);

        return new CustomOAuth2User(oAuth2User, user);
    }
}
