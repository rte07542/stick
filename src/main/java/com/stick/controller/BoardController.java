package com.stick.controller;


import com.stick.domain.board.Board;
import com.stick.dto.BoardCreateRequest;
import com.stick.dto.BoardResponse;
import com.stick.service.BoardService;
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
}
