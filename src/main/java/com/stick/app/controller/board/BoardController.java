package com.stick.app.controller.board;


import com.stick.app.domain.board.Board;
import com.stick.app.dto.BoardCreateRequest;
import com.stick.app.dto.BoardResponse;
import com.stick.app.dto.BoardUpdateRequest;
import com.stick.app.service.board.BoardService;
import com.stick.app.service.space.SpaceMemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
    public Board createBoard(@RequestBody BoardCreateRequest request,
                             HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if(!spaceMemberService.isAdminOrOwner(request.getSpaceId(), userId)) {
            throw new IllegalArgumentException("스페이스 멤버가 아님");
        }
        return boardService.createBoard(request.getName(), request.getSpaceId(), request.getDescription());
    }

    @GetMapping("/space/{spaceId}")
    public List<BoardResponse> getBoardsBySpaceId(
            @PathVariable Long spaceId,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return boardService.getBoardsBySpaceId(spaceId);
    }

    @GetMapping("/{id}")
    public BoardResponse getBoardById(@PathVariable Long id, HttpServletRequest request){
        Long userId = (Long) request.getAttribute("userId");
        Board board = boardService.getBoardById(id);
        if(!spaceMemberService.isMember(board.getSpace().getId(), userId)) {
            throw new IllegalArgumentException("스페이스 멤버가 아님");
        }
        return BoardResponse.from(board,0L,null);
    }

    @PatchMapping("/{id}")
    public BoardResponse updateBoard(@PathVariable Long id,
                                     @Valid @RequestBody BoardUpdateRequest request,
                                     HttpServletRequest httpRequest){
        Long userId = (Long) httpRequest.getAttribute("userId");
        Board board = boardService.getBoardById(id);
        if (!spaceMemberService.isAdminOrOwner(board.getSpace().getId(), userId)) {
            throw new IllegalArgumentException("스페이스 멤버가 아님");
        }
        Board updated = boardService.updateBoard(id, request.getName(), request.getDescription());
        return BoardResponse.from(updated, 0L, null);
    }

    @DeleteMapping("/{id}")
    public void deleteBoard(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long spaceId = boardService.getBoardById(id).getSpace().getId();
        if (!spaceMemberService.isAdminOrOwner(spaceId, userId)) {
            throw new IllegalArgumentException("스페이스 멤버가 아님");
        }
        boardService.deleteBoard(id);
    }

}
