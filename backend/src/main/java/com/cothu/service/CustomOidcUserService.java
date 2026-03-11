package com.cothu.service;

import com.cothu.model.User;
import com.cothu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // Process user and save to database
        processUser(registrationId, oidcUser);

        return oidcUser;
    }

    private void processUser(String registrationId, OidcUser oidcUser) {
        User.AuthProvider provider = User.AuthProvider.valueOf(registrationId.toUpperCase());
        Map<String, Object> attributes = oidcUser.getAttributes();

        String providerId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String avatarUrl = oidcUser.getPicture();

        // Find or create user
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> userRepository.findByEmail(email).orElse(null));

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
    }
}
