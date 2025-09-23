package com.example.popic;

import com.example.popic.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        System.out.println("헤더: " + authHeader);

        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

//         토큰이 없으면 401 반환
//        if (token == null) {
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
//            response.setContentType("application/json");
//            response.getWriter().write("{\"message\": \"토큰이 없습니다.\"}");
//            return;
//        }

        if (token != null && jwtUtil.validateToken(token)) {
            // 토큰 유효 -> SecurityContext에 사용자 정보 저장 가능
            Authentication auth =
                    jwtUtil.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        chain.doFilter(request, response);
    }

//    @Override
//    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
//        String path = request.getServletPath();
//
//        // 제외할 URL 리스트
//        return path.equals("/**")
//                || path.equals("/user/login")
//                || path.equals("/auth/refresh");
//    }

}
