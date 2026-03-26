package com.stick.app.service;

import com.stick.app.domain.board.Board;
import com.stick.app.domain.space.Space;
import com.stick.app.dto.BoardResponse;
import com.stick.app.repository.memo.MemoRepository;
import com.stick.app.repository.space.SpaceRepository;
import com.stick.app.repository.board.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final SpaceRepository spaceRepository;
    private final BoardRepository boardRepository;
    private final MemoRepository memoRepository;


    public Board createBoard(String name, Long spaceId, String description){

        Space space = findSpaceById(spaceId);

        Board board = Board.builder()
                .name(name)
                .space(space)
                .description(description)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return boardRepository.save(board);
    }

    public List<BoardResponse> getBoardsBySpaceId(Long spaceId){
        List<Board> boards = boardRepository.findBySpaceId(spaceId);
        return boards.stream()
                .map(board -> BoardResponse.from(
                        board,
                        memoRepository.countByBoardId(board.getId()),
                        memoRepository.findLastModifiedByBoardId(board.getId())
                ))
                .toList();
    } // 전달받은 spaceId에 속한 Board목록을 DB에서 찾아서 반환하는 함수

    public Board getBoardById(Long id){
        return boardRepository.findById(id)
                .orElseThrow(()-> new IllegalArgumentException("해당 Board가 없음. Id="+id));
    } //optional안에서 Board 하나를 찾아라. 있으면 반환, 없으면 에러.

    @Transactional
    public Board updateBoard(Long boardId, String name, String description) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("해당 Board가 없음. id=" + boardId));

        if(name != null) {
            board.setName(name);
        }
        if (description != null) {
            board.setDescription(description);
        }
        if (name != null && !name.trim().isEmpty()) {
            board.setName(name.trim());
        }

        board.setUpdatedAt(LocalDateTime.now());

        return boardRepository.save(board);
    }//수정함수 : 보드 이름이나 설명 바꾸는 기능

    @Transactional
    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("해당 Board가 없음. id="+id));
        boardRepository.delete(board);
    }//board 지우기

    private Space findSpaceById(Long spaceId) {
        return spaceRepository.findById(spaceId)
                .orElseThrow(() -> new IllegalArgumentException("해당 Space가 없음. id=" + spaceId));
    }

}
