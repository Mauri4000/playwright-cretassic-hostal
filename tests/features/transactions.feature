@e2e
Feature: Ingresos y Egresos — Transactions
  As a hotel admin
  I want to record and view transactions
  So that I can track hotel finances

  Background:
    Given I am logged in as admin
    And I navigate to the transactions page

  @e2e
  Scenario: Transactions page loads
    Then the transactions page should be visible
    And the add transaction button should be visible

  @e2e
  Scenario: Add a test ingreso transaction
    When I click add transaction
    Then the transaction modal should open
    When I fill transaction amount 50
    And I fill transaction description "E2E Test"
    And I select category "H04-EARLY/LATE CHECK OUT"
    And I click save transaction
    Then the transaction modal should close

  @e2e
  Scenario: Verify transaction appears in the list
    Then I should see a transaction with amount "50"

  @e2e
  Scenario: Delete test transaction (cleanup)
    When I delete test transaction "E2E Test"
    Then I should not see a transaction description "E2E Test"

  @e2e
  Scenario: Navigate transaction months
    When I click next month on transactions
    Then the transactions page should be visible
    When I click prev month on transactions
    Then the transactions page should be visible
