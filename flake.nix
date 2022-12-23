{
  description = "beancount";

  inputs = { nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable"; };

  outputs = inputs:
    let
      system = "x86_64-linux";
      pkgs = inputs.nixpkgs.legacyPackages.${system};
    in {
      devShell."${system}" = pkgs.mkShell { buildInputs = with pkgs; [ act ]; };
    };
}
