package com.stick.app.controller;


import com.stick.app.domain.board.Board;
import com.stick.app.dto.BoardCreateRequest;
import com.stick.app.dto.BoardResponse;
import com.stick.app.dto.BoardUpdateRequest;
import com.stick.app.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/boards")
public class BoardController {
    private final BoardService boardService;

    @PostMapping
    public Board createBoard(@RequestBody BoardCreateRequest request) {
        return boardService.createBoard(
                request.getName(),
                request.getSpaceId(),
                request.getDescription()
        );
    }

    @GetMapping("/space/{spaceId}")
    public List<BoardResponse> getBoardsBySpaceId(@PathVariable Long spaceId) {
        return boardService.getBoardsBySpaceId(spaceId);
    }

    @GetMapping("/{id}")
    public Board getBoardById(@PathVariable Long id){
        return boardService.getBoardById(id);
    }

    @PutMapping("/{boardId}")
    public Board updateBoard(@PathVariable Long boardId,
                               @RequestParam String name,
                               @RequestParam String description) {
        return boardService.updateBoard(boardId, name, description);
    }

    @DeleteMapping("/{id}")
    public void deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
    }

    @PatchMapping("/{id}")
    public Board updateBoard(@PathVariable Long id, @RequestBody BoardUpdateRequest request){
        return boardService.updateBoard(id, request.getName(), request.getDescription());
    }
}
