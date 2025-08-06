package com.communet.malmoon.filter.service;

import com.communet.malmoon.file.domain.FileType;
import com.communet.malmoon.file.dto.response.FileUploadRes;
import com.communet.malmoon.file.service.FileService;
import com.communet.malmoon.filter.domain.Filter;
import com.communet.malmoon.filter.dto.request.FilterStoreReq;
import com.communet.malmoon.filter.dto.response.FilterDto;
import com.communet.malmoon.filter.dto.response.FilterListRes;
import com.communet.malmoon.filter.repository.FilterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FilterService {

    private final FilterRepository filterRepository;
    private final FileService fileService;

    public FilterListRes getFilters() {
        return new FilterListRes(filterToDto(filterRepository.findAll()));
    }

    public FilterListRes getFiltersByIds(List<Long> filterIds) {
        return new FilterListRes(filterToDto(filterRepository.findAllById(filterIds)));
    }

    private List<FilterDto> filterToDto(List<Filter> filters) {
        List<FilterDto> filterDtoList = new ArrayList<>();
        filters.forEach(filter -> {
            FilterDto filterDto = new FilterDto();
            filterDto.setFilterId(filter.getFilterId());
            filterDto.setName(filter.getName());
            filterDto.setFilterLensId(filter.getFilterLensId());
            filterDto.setFileUrl(fileService.getFileUrl(filter.getFileId()));
            filterDtoList.add(filterDto);
        });
        return filterDtoList;
    }

    public void storeFilter(FilterStoreReq filterStoreReq, MultipartFile file) {
        FileUploadRes fileUploadRes = fileService.uploadFile(FileType.FILTER.getDirectory(), file);

        Filter filter = Filter.builder()
                .name(filterStoreReq.getName())
                .filterLensId(filterStoreReq.getFilterLensId())
                .fileId(fileUploadRes.getFileId())
                .build();

        filterRepository.save(filter);
    }
}
