# frozen_string_literal: true

marked_no_deployment_dependancy = github.pr_body =~ /\[X\] This change does not add a deployment dependancy/i
has_deployment_dependancy_label = github.pr_labels.include? 'Deployment Dependancy'
has_deployment_dependancy_description = github.pr_body =~ /[#\s]*?deployment dependancy[s\s]*?$/ix
puts(!marked_no_deployment_dependancy)
puts(!has_deployment_dependancy_label)
puts(!has_deployment_dependancy_description)

if !marked_no_deployment_dependancy && !has_deployment_dependancy_label
  failure("Pleae explicitly check off [ ] This change does not add a deployment dependancy
  or add 'Deployment Dependancy' label and description")
end

if has_deployment_dependancy_label && !has_deployment_dependancy_description
  failure("Please add 'Deployment Dependancy' heading to PR description with description of services involved")
end
