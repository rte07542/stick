package com.stick.service;

import com.stick.domain.board.Board;
import com.stick.domain.space.Space;
import com.stick.repository.SpaceRepository;
import com.stick.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final SpaceRepository spaceRepository;
    private final BoardRepository boardRepository;


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

    public List<Board> getBoardsBySpaceId(Long spaceId){
        return boardRepository.findBySpaceId(spaceId);
    } // 전달받은 spaceId에 속한 Board목록을 DB에서 찾아서 반환하는 함수

    public Board getBoardById(Long id){
        return boardRepository.findById(id)
                .orElseThrow(()-> new IllegalArgumentException("해당 Board가 없음. Id="+id));
    } //optional안에서 Board 하나를 찾아라. 있으면 반환, 없으면 에러.

    public Board updateBoard(Long boardId, String name, String description) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("해당 Board가 없음. id=" + boardId));

        board.setName(name);
        board.setDescription(description);
        board.setUpdatedAt(LocalDateTime.now());

        return boardRepository.save(board);
    }//수정함수 : 보드 이름이나 설명 바꾸는 기능

    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("해당 Board가 없음. id="+id));
        boardRepository.delete(board);
    }

    private Space findSpaceById(Long spaceId) {
        return spaceRepository.findById(spaceId)
                .orElseThrow(() -> new IllegalArgumentException("해당 Space가 없음. id=" + spaceId));
    }

}
