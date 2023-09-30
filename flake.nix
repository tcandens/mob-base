{
  description = "Node.js Development environment which autoloads environment variables from dotenv file.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let pkgs = nixpkgs.legacyPackages.${system}; in 
        {
          devShells.default = pkgs.mkShell {
            packages = with pkgs; [
              nodejs_20
              # nodePackages.pnpm
            ];
            shellHook = ''
              set -a
              source .env
              set +a
            '';
          };
        }
      );
}
