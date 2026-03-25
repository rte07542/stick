package com.stick.app.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardCreateRequest {
    private String name;
    private Long spaceId;
    private String description;
}
