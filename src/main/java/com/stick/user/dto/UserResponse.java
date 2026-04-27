package com.stick.user.dto;

import com.stick.user.domain.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String loginId;
    private String nickname;
    private LocalDateTime createdAt;
    private String token;
    private String profileImageUrl;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .loginId(user.getLoginId())
                .nickname(user.getNickname())
                .createdAt(user.getCreatedAt())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    public static UserResponse from(User user, String token) {
        return UserResponse.builder()
                .id(user.getId())
                .loginId(user.getLoginId())
                .nickname(user.getNickname())
                .createdAt(user.getCreatedAt())
                .token(token)
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
