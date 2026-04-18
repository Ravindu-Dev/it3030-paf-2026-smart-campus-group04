package com.smartcampus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final MaintenanceInterceptor maintenanceInterceptor;

    public WebConfig(MaintenanceInterceptor maintenanceInterceptor) {
        this.maintenanceInterceptor = maintenanceInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Register the maintenance interceptor to apply to all /api/** requests
        registry.addInterceptor(maintenanceInterceptor)
                .addPathPatterns("/**");
    }
}
