package com.stick.app.repository.memo;

import com.stick.app.domain.memo.Memo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MemoRepository extends JpaRepository<Memo, Long> {
    List<Memo> findByBoardId(Long BoardId);
    Long countByBoardId(Long boardId);
    @Query(value = "SELECT MAX(updated_at) FROM memo WHERE board_id = :boardId", nativeQuery = true)
    LocalDateTime findLastModifiedByBoardId(@Param("boardId") Long boardId); // 이 보드에서 가장 최근에 수정된 메모 시간 하나 출력
}