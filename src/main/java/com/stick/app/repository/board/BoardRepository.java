package com.stick.app.repository.board;

import com.stick.app.domain.board.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findBySpaceId(Long spaceId);
}