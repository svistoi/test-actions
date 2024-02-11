
deployment_dependancy? = github.pr_body.include? =~ "[ ] This change does not add a deployment dependancy"
deployment_dependancy_label? = github.pr_labels.include? "Deployment Dependancy"
deployment_dependancy_description? = github.pr_body =~ /[#\s]*?deployment dependancy[s\s]*?$/gmi

failure("Please check off that this PR has no service deployment dependancies or add a label and description under heading 'Deployment Dependancy' describing the dependancy") if deployment_dependancy? && (!deployment_dependancy_label? && !deployment_dependancy_description)
