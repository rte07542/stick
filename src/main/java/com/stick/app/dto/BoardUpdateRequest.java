package com.stick.app.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardUpdateRequest {
    private String name;
    private String description;
}
