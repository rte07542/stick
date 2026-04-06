package com.stick.app.controller;

import com.stick.app.domain.memo.Memo;
import com.stick.app.dto.MemoCreateRequest;
import com.stick.app.dto.MemoResponse;
import com.stick.app.service.MemoService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/memos")
public class MemoController {
    private final MemoService memoService;

    @PostMapping
    public MemoResponse createMemo(@RequestBody MemoCreateRequest request) {
        return memoService.createMemo(request);
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
                                   @RequestParam String color,
                                   HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        MemoResponse memo = MemoResponse.from(memoService.getMemoById(memoId));
        if (!memo.getAuthorId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한 없음");
        }
        return MemoResponse.from(memoService.updateMemo(memoId,content,color));
    }

    @DeleteMapping("/{id}")
    public void deleteMemo(@PathVariable Long id, HttpServletRequest request){
        Long userId = (Long) request.getAttribute("userId");
        MemoResponse memo = MemoResponse.from(memoService.getMemoById(id));
        if (!memo.getAuthorId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한 없음");
        }
        memoService.deleteMemo(id);
    }

}
