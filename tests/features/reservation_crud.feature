@e2e
Feature: Reservation CRUD — Mayo 2026
  As a hotel receptionist
  I want to create, view and delete reservations in the calendar
  So that I can manage room occupancy

  Background:
    Given I am logged in as admin
    And I navigate to May 2026 on the calendar

  @e2e
  Scenario: Navigate to May 2026
    Then the calendar should show "Mayo"
    And the calendar should show "2026"

  @cleanup
  Scenario: Cleanup leftover test reservations
    When I try to delete any test reservation in room "A1" day 15
    And I try to delete any test reservation in room "A1" day 20
    Then the calendar should show "Mayo"

