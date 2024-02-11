# frozen_string_literal: true

has_deployment_dependancy = github.pr_body.include? '[ ] This change does not add a deployment dependancy'
has_deployment_dependancy_label = github.pr_labels.include? 'Deployment Dependancy'
has_deployment_dependancy_description = github.pr_body =~ /[#\s]*?deployment dependancy[s\s]*?$/ix

if has_deployment_dependancy && (!has_deployment_dependancy_label && !has_deployment_dependancy_description)
  failure("Please check off that this PR has no service deployment dependancies
  or add a label and description under heading 'Deployment Dependancy' describing the dependancy")
end
