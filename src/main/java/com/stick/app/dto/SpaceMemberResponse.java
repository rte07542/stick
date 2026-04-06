package com.stick.app.dto;

import com.stick.app.domain.space.SpaceMember;
import com.stick.app.domain.space.SpaceRole;
import com.stick.global.domain.BaseEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SpaceMemberResponse extends BaseEntity {
    private Long id;
    private Long spaceId;
    private Long userId;
    private String nickname;
    private SpaceRole role;
    private LocalDateTime createdAt;

    public static SpaceMemberResponse from(SpaceMember member) {
        return SpaceMemberResponse.builder()
                .id(member.getId())
                .spaceId(member.getSpace().getId())
                .userId(member.getUser().getId())
                .nickname(member.getUser().getNickname())
                .role(member.getRole())
                .createdAt(member.getCreatedAt())
                .build();
    }
}
