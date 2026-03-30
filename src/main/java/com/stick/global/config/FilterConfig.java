package com.stick.global.config;

import com.stick.global.jwt.JwtFilter;
import com.stick.global.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class FilterConfig {
    private final JwtUtil jwtUtil;

    @Bean
    public FilterRegistrationBean<JwtFilter> jwtFilter() {
        FilterRegistrationBean<JwtFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new JwtFilter(jwtUtil));
        bean.addUrlPatterns("/*"); //모든 요청에 적용
        bean.setOrder(1);
        return bean;
    }
}
