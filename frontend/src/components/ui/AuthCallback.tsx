import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './LoginPage.css';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [error, setError] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            login(token)
                .then(() => {
                    navigate('/', { replace: true });
                })
                .catch(() => {
                    setError('Đăng nhập thất bại. Vui lòng thử lại.');
                    setTimeout(() => navigate('/login', { replace: true }), 3000);
                });
        } else {
            setError('Không tìm thấy token. Vui lòng thử lại.');
            setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="auth-callback">
            <div className="auth-callback-content">
                {!error ? (
                    <>
                        <div className="login-spinner" style={{ margin: '0 auto 16px' }} />
                        <span>Đang xác thực...</span>
                    </>
                ) : (
                    <div className="auth-error">{error}</div>
                )}
            </div>
        </div>
    );
}
