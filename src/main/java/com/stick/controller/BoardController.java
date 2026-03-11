package com.stick.controller;


import com.stick.domain.board.Board;
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
    public Board createBoard(@RequestParam String name,
                             @RequestParam Long spaceId,
                             @RequestParam String description) {
        return boardService.createBoard(name, spaceId, description);
    }

    @GetMapping
    public List<Board> getBoardsBySpaceId(@PathVariable Long spaceId) {
        return boardService.getBoardsBySpaceId(spaceId);
    }

    @GetMapping("/{id}")
    public Board getBoardById(@PathVariable Long id){
        return boardService.getBoardById(id);
    }

    @PutMapping("/{boardId}")
    public Board getUpdateBoard(@PathVariable Long boardId,
                               @RequestParam String name,
                               @RequestParam String description) {
        return boardService.updateBoard(boardId, name, description);
    }

    @DeleteMapping("/{id}")
    public void deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
    }
}
