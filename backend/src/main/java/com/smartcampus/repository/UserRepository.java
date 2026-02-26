package com.smartcampus.repository;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB repository for {@link User} documents.
 * Provides standard CRUD + custom query methods.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /** Find a user by their email address. */
    Optional<User> findByEmail(String email);

    /** Find a user by their OAuth provider ID (e.g., Google 'sub' claim). */
    Optional<User> findByProviderId(String providerId);

    /** Find all users with a specific role (for admin filtering). */
    List<User> findByRole(Role role);

    /** Check if a user exists with the given email. */
    boolean existsByEmail(String email);
}
