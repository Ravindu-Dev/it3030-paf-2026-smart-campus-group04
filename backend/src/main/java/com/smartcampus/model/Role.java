package com.smartcampus.model;

/**
 * Defines the roles available in the Smart Campus Operations Hub.
 * Used for role-based access control (RBAC) throughout the application.
 *
 * <p>
 * Role hierarchy (for reference, not enforced automatically):
 * </p>
 * <ul>
 * <li>USER — Default role for all new users (students, staff)</li>
 * <li>TECHNICIAN — Campus maintenance and technical staff</li>
 * <li>MANAGER — Department/facility managers</li>
 * <li>ADMIN — Full system administrators</li>
 * </ul>
 */
public enum Role {
    USER,
    ADMIN,
    TECHNICIAN,
    MANAGER
}
