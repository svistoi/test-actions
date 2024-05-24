# frozen_string_literal: true

require 'json'

message(github.pr_json['number'])

pr_details = github.api.pull_request('svistoi/test-actions', github.pr_json['number'])
reviewers = pr_details['requested_reviewers'].map(&:login)

author = pr_details['requested_reviewers'].map(&:login)
