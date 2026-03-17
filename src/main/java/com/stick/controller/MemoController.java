package com.stick.controller;

import com.stick.domain.memo.Memo;
import com.stick.service.MemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/Memos")
public class MemoController {
    private final MemoService memoService;

    @PostMapping
    public Memo createMemo(@RequestParam String content,
                           @RequestParam Long boardId,
                           @RequestParam Long authorId,
                           @RequestParam String color) {
        return memoService.createMemo(content, boardId, authorId, color);
    }

    @GetMapping
    public List<Memo> getMemosByBoardId(@PathVariable Long boardId) {
        return memoService.getMemosByBoardId(boardId);
    }

    @GetMapping("/{id}")
    public Memo getMemoById(@PathVariable Long id){
        return memoService.getMemoById(id);
    }

    @PutMapping("/{memoId}")
    public Memo updateMemo(@PathVariable Long memoId,
                           @RequestParam String content,
                           @RequestParam String color) {
        return memoService.updateMemo(memoId, content, color);
    }

    @DeleteMapping("/{id}")
    public void deleteMemo(@PathVariable Long id){
        memoService.deleteMemo(id);
    }

}
