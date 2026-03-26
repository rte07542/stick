package com.stick.app.dto;

import com.stick.app.domain.space.SpaceRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceMemberCreateRequest {
    private Long userId;
    private SpaceRole role;
}
