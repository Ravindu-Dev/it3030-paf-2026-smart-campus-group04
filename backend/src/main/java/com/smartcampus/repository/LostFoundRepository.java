package com.smartcampus.repository;

import com.smartcampus.model.LostFoundItem;
import com.smartcampus.model.LostFoundItemStatus;
import com.smartcampus.model.LostFoundItemType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LostFoundRepository extends MongoRepository<LostFoundItem, String> {

    List<LostFoundItem> findByStatusOrderByCreatedAtDesc(LostFoundItemStatus status);

    List<LostFoundItem> findByTypeOrderByCreatedAtDesc(LostFoundItemType type);

    List<LostFoundItem> findByTypeAndStatusOrderByCreatedAtDesc(LostFoundItemType type, LostFoundItemStatus status);

    List<LostFoundItem> findByReportedByUserIdOrderByCreatedAtDesc(String userId);

    List<LostFoundItem> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);

    List<LostFoundItem> findAllByOrderByCreatedAtDesc();
}
