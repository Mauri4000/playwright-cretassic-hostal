@smoke
Feature: Admin Login — Cretassic Hostal
  As a hostal staff member
  I want to log in to the admin panel
  So that I can manage reservations and hostal operations

  Background:
    Given I am on the admin login page

  @smoke
  Scenario: Successful login with valid credentials
    When I enter valid admin credentials
    Then I should be redirected to the dashboard
    And the dashboard should display hotel stats

  @smoke
  Scenario: Failed login with wrong password
    When I enter email "test@cretassichostal.com" and password "wrongpassword"
    Then I should see an error message
    And I should remain on the login page

  @e2e
  Scenario: Login and access calendar
    When I enter valid admin credentials
    Then I should be redirected to the dashboard
    When I navigate to the calendar page
    Then the calendar grid should be visible
