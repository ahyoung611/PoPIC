package com.example.popic;


import com.example.popic.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configure(http)) // CORS 설정
                .csrf(csrf -> csrf.disable()) // CSRF 비활성화
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/user/login", "/auth/refresh", "/user/join",
                                "/vendor/login", "/vendor/join", "/admin/login",
                                "/auth/**", "/images", "/scan-qr", "/", "/login",
                                "/board/file/**", "/popupStore/monthly",
                                "/popupStore/popupDetail/**","/qr-stream","/reservations/confirm", "/popupStore/popupSchedule/**",
                                "/api/vendorPopups/**","/popupStore/category", "/popupStore/category/**").permitAll() // 로그인/회원가입/토큰 갱신은 허용
                        .requestMatchers("/admin/**").hasRole("ADMIN") // 관리자 페이지 진입 방지
                        .anyRequest().authenticated() // 나머지는 인증 필요
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://3.36.103.80:5173",       // 기존 IP (테스트용)
                "http://www.popic.store:5173",   // 🚨 [재추가] 프론트엔드 실행 포트 포함 🚨
                "http://www.popic.store",        // 상용 배포용 (포트 생략)
                "http://popic.store"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowCredentials(true); // credentials 허용
        configuration.setAllowedHeaders(List.of("*")); // 모든 헤더 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
