package com.stick.controller;

import com.stick.domain.memo.Memo;
import com.stick.dto.MemoResponse;
import com.stick.service.MemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/memos")
public class MemoController {
    private final MemoService memoService;

    @PostMapping
    public MemoResponse createMemo(@RequestParam String content,
                           @RequestParam Long boardId,
                           @RequestParam Long authorId,
                           @RequestParam String color) {
        Memo memo = memoService.createMemo(content, boardId, authorId, color);
        return MemoResponse.from(memo);
    }

    @GetMapping("/board/{boardId}")
    public List<MemoResponse> getMemosByBoardId(@PathVariable Long boardId) {
        return memoService.getMemosByBoardId(boardId)
                .stream()
                .map(MemoResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public MemoResponse getMemoById(@PathVariable Long id){
        return MemoResponse.from(memoService.getMemoById(id));
    }

    @PutMapping("/{memoId}")
    public MemoResponse updateMemo(@PathVariable Long memoId,
                           @RequestParam String content,
                           @RequestParam String color) {
        Memo memo = memoService.updateMemo(memoId,content,color);
        return MemoResponse.from(memo);
    }

    @DeleteMapping("/{id}")
    public void deleteMemo(@PathVariable Long id){
        memoService.deleteMemo(id);
    }

}
