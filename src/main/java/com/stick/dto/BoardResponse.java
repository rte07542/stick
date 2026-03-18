package com.stick.dto;

import com.stick.domain.board.Board;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BoardResponse {
    private Long id;
    private String name;
    private String description;
    private Long spaceId;
    private long memoCount;

    public static BoardResponse from(Board board, long memoCount) {
        return BoardResponse.builder()
                .id(board.getId())
                .name(board.getName())
                .description(board.getDescription())
                .spaceId(board.getSpace().getId())
                .memoCount(memoCount)
                .build();
    }
}
