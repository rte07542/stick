package com.stick.app.controller;


import com.stick.app.domain.board.Board;
import com.stick.app.dto.BoardCreateRequest;
import com.stick.app.dto.BoardResponse;
import com.stick.app.dto.BoardUpdateRequest;
import com.stick.app.service.BoardService;
import com.stick.app.service.SpaceMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/boards")
public class BoardController {
    private final BoardService boardService;
    private final SpaceMemberService spaceMemberService;

    @PostMapping
    public BoardResponse createBoard(@RequestBody BoardCreateRequest request) {
        Board board = boardService.createBoard(
                request.getName(),
                request.getSpaceId(),
                request.getDescription()
        );
        return BoardResponse.from(board, 0L, null);
    }

    //TODO: JWT 구현 후 @RequestParam 제거하고 @RequestAttribute("userId")로 교체
    @GetMapping("/space/{spaceId}")
    public List<BoardResponse> getBoardsBySpaceId(
            @PathVariable Long spaceId,
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        return boardService.getBoardsBySpaceId(spaceId);
    }

    @GetMapping("/{id}")
    public BoardResponse getBoardById(@PathVariable Long id){
        Board board = boardService.getBoardById(id);
        return BoardResponse.from(board,0L,null);
    }

    @PatchMapping("/{id}")
    public BoardResponse updateBoard(@PathVariable Long id,
                                     @RequestBody BoardUpdateRequest request){
       Board board = boardService.updateBoard(id, request.getName(), request.getDescription());
       return BoardResponse.from(board,0L, null);
    }

    @DeleteMapping("/{id}")
    public void deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
    }
}
