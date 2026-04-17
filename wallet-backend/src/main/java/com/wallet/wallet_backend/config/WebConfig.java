package com.wallet.wallet_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Admin root - bilkul waise jaise tere working app mein "/" ke liye hai
        registry.addViewController("/admin")
                .setViewName("forward:/admin/index.html");
        
        registry.addViewController("/admin/")
                .setViewName("forward:/admin/index.html");
        
        // Catch-all for SPA routes (ye pattern tere working app se exactly copy kiya)
        registry.addViewController("/admin/{path:[^\\.]*}")
                .setViewName("forward:/admin/index.html");
        
        registry.addViewController("/admin/{path1}/{path2:[^\\.]*}")
                .setViewName("forward:/admin/index.html");
        
        registry.addViewController("/admin/{path1}/{path2}/{path3:[^\\.]*}")
                .setViewName("forward:/admin/index.html");
    }
}