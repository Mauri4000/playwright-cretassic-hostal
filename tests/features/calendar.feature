@e2e
Feature: Calendar Management — Cretassic Hostal
  As a hostal receptionist
  I want to view and manage the reservation calendar
  So that I can track room occupancy

  Background:
    Given I am logged in as admin
    And I am on the calendar page

  @e2e
  Scenario: Calendar loads with room grid
    Then the calendar grid should be visible
    And I should see room rows on the calendar

  @e2e
  Scenario: Navigate to next month
    When I click the next month button
    Then the calendar should show the next month

  @e2e
  Scenario: Navigate to previous month and back to today
    When I click the next month button
    And I click the today button
    Then the calendar should show the current month
