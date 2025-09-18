// com.example.popic.WebConfig
package com.example.popic;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${uploadPath:${user.home}/popic-uploads/}")
    private String uploadPath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String dir = uploadPath.endsWith("/") ? uploadPath : uploadPath + "/";
        // 정적 접근: http://localhost:8080/uploads/파일명
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + dir);
    }
}
