# frozen_string_literal: true

require 'json'

message("#{github.pr_json.to_str}")
message("#{github.pr_json['number']}")

pr_details = github.api.pull_request('svistoi/test-actions', github.pr_json['number'])
message("#{pr_details.to_str}")
