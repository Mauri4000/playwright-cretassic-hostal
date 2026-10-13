@e2e
Feature: Vitrina — Product Management
  As a hotel admin
  I want to manage vitrina products
  So that I can track snacks and items sold to guests

  Background:
    Given I am logged in as admin
    And I navigate to the vitrina page

  @e2e
  Scenario: Vitrina page loads with product list
    Then the vitrina page should be visible
    And the add product button should be visible

  @e2e
  Scenario: Add a test product to vitrina
    When I click add product
    Then the add product modal should open
    When I fill product name "TEST E2E PRODUCTO"
    And I fill product price 5.50
    And I submit the product form
    Then the add product modal should close

  @e2e
  Scenario: Verify test product appears in vitrina
    Then I should see a product named "TEST E2E PRODUCTO"

  @e2e
  Scenario: Delete test product from vitrina
    When I delete the product named "TEST E2E PRODUCTO"
    Then I should not see a product named "TEST E2E PRODUCTO"
