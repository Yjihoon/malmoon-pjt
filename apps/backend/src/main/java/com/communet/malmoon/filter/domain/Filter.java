package com.communet.malmoon.filter.domain;

import com.communet.malmoon.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Filter")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Filter extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long filterId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "filter_lens_id", length = 100)
    private String filterLensId;

    @Column(name = "file_id", nullable = false)
    private Long fileId;
}
