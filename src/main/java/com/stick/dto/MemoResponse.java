package com.stick.dto;

import com.stick.domain.memo.Memo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MemoResponse {
    private Long id;
    private Long boardId;
    private Long authorId;
    private String content;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MemoResponse from(Memo memo) {
        return MemoResponse.builder()
                .id(memo.getId())
                .boardId(memo.getBoard().getId())
                .authorId(memo.getAuthorId())
                .content(memo.getContent())
                .color(memo.getColor())
                .createdAt(memo.getCreatedAt())
                .updatedAt(memo.getUpdatedAt())
                .build();
    }
}
