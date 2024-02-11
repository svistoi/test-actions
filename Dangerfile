# frozen_string_literal: true

marked_no_deployment_dependency = github.pr_body =~ /\[X\] This change does not add a deployment dependency/i
has_deployment_dependency_label = github.pr_labels.include? 'Deployment Dependency'
has_deployment_dependency_description = github.pr_body =~ /[#\s]*?deployment dependency[s\s]*?$/ix
puts(github.pr_body)
puts(marked_no_deployment_dependency)
puts(has_deployment_dependency_label)
puts(has_deployment_dependency_description)

if !marked_no_deployment_dependency && !has_deployment_dependency_label
  failure("Pleae explicitly check off [ ] This change does not add a deployment dependency
  or add 'Deployment Dependency' label and description")
end

if has_deployment_dependency_label && !has_deployment_dependency_description
  failure("Please add 'Deployment Dependency' heading to PR description with description of services involved")
end
