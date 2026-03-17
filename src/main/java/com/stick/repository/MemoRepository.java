package com.stick.repository;

import com.stick.domain.memo.Memo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MemoRepository extends JpaRepository<Memo, Long> {
    List<Memo> findByBoardId(Long BoardId);
}