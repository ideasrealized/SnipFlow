---
description: 
globs: 
alwaysApply: false
---
---
description: Rules and best practices for automated and manual testing strategies.
globs: 
alwaysApply: false
---
Testing Rules  

Tests following this protocol rely on structured organization and proper documentation of test execution and results. The following directories and files are essential to maintaining an effective testing process:  

- The /tests/ folder contains instructions for various types of tests, with each test having a corresponding [test_name].md file.  
- The /tests/tools/ folder stores testing tools referenced in the instructions.  
- The /docs/console/logs/ directory contains all console logs for each session and should be reviewed for completeness.
- The /tests/results/ is where you create and read summarizations of your test results--and they should be saved using this format /tests/results/[test_name][date][hh:mm:ss]
- Every project folder must contain a _change.log file that documents modifications to files or functions within that folder. This file must be kept up to date.  

Test Organization  

1. Maintain a structured and continuously updated library of tests to verify the correctness of all functions and components.  
2. Place all tests in the /tests/ directory.  
3. Mirror the project structure in test files.  
4. Use pytest as the testing framework.  
5. Follow consistent test naming conventions, using test_function_name_scenario or test_class_name_method_scenario.  
6. The /tests/ directory should be divided into:  
   - Startup tests to ensure system components initialize correctly and required dependencies are in place.  
   - Debugging tests to identify issues in existing features and confirm bug fixes.  
7. When this rule is called, review the index.md file to check for file discrepancies, ensuring all files are accounted for and that all applicable functions and features have corresponding tests.  
8. Maintain a test history for contextual awareness by storing test history in the /tests/history/ directory.  
   - Each test should have a corresponding [test_name].md file.  
   - Test history should be date and time stamped.  
   - History should be cleaned after every thirty tests to remove outdated records.  
9. If a test fails, the system should prompt the review of the following troubleshooting documents:  
   - troubleshooting.mdc  
   - problem_solving.mdc  
   - best_practices.mdc  
   - main.mdc  
10. The AI agent should create a bug report in the /docs/bugs/reports/ directory, an action plan in /docs/reports/plans/, and a checklist in fixes.md.  

Test Coverage Requirements  

1. Maintain a minimum of eighty percent code coverage.  
2. Ensure all critical paths are covered.  
3. Include edge cases and boundary conditions.  
4. Test error conditions and exception handling.  
5. Document any areas with less coverage and provide justification.  

Test Library Maintenance  

1. Ensure that all new features and changes include corresponding test cases.  
2. Regularly review and update tests to reflect codebase changes.  
3. Refactor outdated tests to align with the latest system behavior.  
4. Maintain a repository of reusable test utilities for efficiency.  
5. Clearly document the purpose and expected behavior of tests.  
6. Archive deprecated tests while keeping a history for reference.  

Test Types  

Unit Tests  
- Test individual components in isolation.  
- Mock dependencies appropriately.  
- Focus on single responsibility.  
- Verify component behavior.  

Integration Tests  
- Test component interactions.  
- Verify system integration.  
- Test data flow between components.  
- Validate interface contracts.  

End-to-End Tests  
- Test critical user flows.  
- Validate system behavior.  
- Test real-world scenarios.  
- Include UI and UX testing.  

Performance Tests  
- Test system performance.  
- Measure response times.  
- Validate resource usage.  
- Test under load conditions.  

Test Data Management  

1. Use fixtures for test data.  
2. Create realistic test datasets.  
3. Clean up test data after execution.  
4. Document data requirements.  
5. Version control test data.  
6. Use appropriate data generators.  

Test Quality Standards  

1. Follow the arrange, act, assert pattern.  
   - Arrange: Set up test conditions.  
   - Act: Execute the test.  
   - Assert: Verify results.  
2. Write clear, maintainable tests.  
3. Use meaningful test names.  
4. Keep tests focused and atomic.  
5. Avoid test interdependence.  

Mocking Guidelines  

1. Mock external dependencies.  
2. Use appropriate mocking strategies, including HTTP requests, database calls, and file system operations.  
3. Document mock behavior.  
4. Verify mock interactions.  
5. Use realistic mock data.  

Test Environment  

1. Use isolated test environments.  
2. Clean up resources after tests.  
3. Handle test databases properly by using a separate test database, resetting database state, and using transactions where appropriate.  
4. Manage test configuration.  
5. Document environment setup.  

Continuous Integration  

1. Run all tests in the CI pipeline.  
2. Report test coverage metrics.  
3. Fail builds on test failures.  
4. Monitor test performance over time.  
5. Maintain historical test trends to track regressions.  

Documentation Requirements  

1. Document test requirements for all modules.  
2. Include test setup instructions.  
3. Document test data sources.  
4. Maintain test documentation alongside the codebase.  
5. Clearly define test patterns and best practices.  

Example Test Structure  

import pytest  
from unittest.mock import Mock  

def test_process_data_valid_input():  
    # Arrange  
    test_data = {"key": "value"}  
    mock_service = Mock()  
    mock_service.process.return_value = True  

    # Act  
    result = process_data(test_data, service=mock_service)  

    # Assert  
    assert result is True  
    mock_service.process.assert_called_once_with(test_data)  