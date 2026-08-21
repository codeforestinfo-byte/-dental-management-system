package com.dentaflow.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaginatedResponse<T> {

    private boolean success;
    private String message;
    private List<T> data;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> PaginatedResponse<T> of(List<T> data, int currentPage,
                                                int totalPages, long totalElements, int pageSize) {
        return PaginatedResponse.<T>builder()
                .success(true)
                .message("Data retrieved successfully")
                .data(data)
                .currentPage(currentPage)
                .totalPages(totalPages)
                .totalElements(totalElements)
                .pageSize(pageSize)
                .build();
    }
}
