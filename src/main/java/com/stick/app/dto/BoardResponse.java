package com.stick.app.dto;

import com.stick.app.domain.board.Board;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BoardResponse {
    private Long id;
    private String name;
    private String description;
    private Long spaceId;
    private long memoCount;
    private LocalDateTime lastModified;

    public static BoardResponse from(Board board, long memoCount, LocalDateTime lastModified) {
        return BoardResponse.builder()
                .id(board.getId())
                .name(board.getName())
                .description(board.getDescription())
                .spaceId(board.getSpace().getId())
                .memoCount(memoCount)
                .lastModified(lastModified)
                .build();
    }
}
