package com.smartcampus.repository;

import com.smartcampus.model.Route;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RouteRepository extends MongoRepository<Route, String> {
    List<Route> findByActive(boolean active);
}
