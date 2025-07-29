setup:
    #!/bin/bash
    set -e

    echo "🚀 Setting up FormSG demo for local development..."

    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi

    if [ ! -d ".formsg-base" ]; then
        echo "📦 Cloning FormSG base repository..."
        git clone --depth 1 --branch release-al2 https://github.com/opengovsg/FormSG.git .formsg-base
        echo "✅ FormSG base cloned successfully"
    else
        echo "📁 FormSG base already exists, updating..."
        cd .formsg-base
        git fetch origin release-al2
        git reset --hard origin/release-al2
        cd ..
        echo "✅ FormSG base updated successfully"
    fi

    echo "🔧 Applying demo customizations..."
    cp -rf replacements/* .formsg-base/
    echo "✅ Demo customizations applied"

    echo "Installing dependencies and initial setup..."
    cd .formsg-base
    npm install && npm --prefix serverless/virus-scanner install
    npm run build:frontend

    echo "✅ Setup complete! You can now run 'just start' to launch the FormSG demo."

# Start the FormSG demo
start:
    #!/bin/bash
    set -e

    if [ ! -d ".formsg-base" ]; then
        echo "❌ Demo not set up yet. Run 'just setup' first."
        exit 1
    fi

    cd .formsg-base
    echo "Starting FormSG demo on local..."

    npm run dev:frontend & \
    docker-compose -f docker-compose.yml -f ../docker-compose.override.yml up -d

stop:
    test -d .formsg-base && cd .formsg-base && docker-compose -f docker-compose.yml -f ../docker-compose.override.yml down || echo '❌ Demo not set up. Nothing to stop.'

# Clean up all demo files and containers
clean:
    #!/bin/bash
    set -e

    echo "🧹 Cleaning up FormSG demo..."

    if [ -d ".formsg-base" ]; then
        cd .formsg-base
        docker-compose -f docker-compose.yml -f ../docker-compose.override.yml down -v
        cd ..
    fi

    if [ -d ".formsg-base" ]; then
        echo "🗑️  Removing FormSG base..."
        rm -rf .formsg-base
    fi

    echo "✅ Cleanup complete!"

# Show logs from running demo on local
logs:
    test -d .formsg-base && cd .formsg-base && docker-compose -f docker-compose.yml -f ../docker-compose.override.yml logs -f || echo '❌ Demo not set up. Run just setup first.'

# Reset the local database
reset-db:
    test -d .formsg-base && cd .formsg-base && docker-compose -f docker-compose.yml -f ../docker-compose.override.yml exec database mongosh formsg ../bin/reset-db.mongodb.js || echo '❌ Demo not set up. Run just setup first.'

# Show differences between demo replacements and base FormSG
diff:
    #!/bin/bash
    echo "🔍 Showing differences between demo replacements and base FormSG..."
    echo ""

    # Temp directory, create and clean up on exit
    temp_base=$(mktemp -d)
    trap "rm -rf $temp_base" EXIT

    echo "📦 Cloning fresh base FormSG for comparison..."
    git clone --depth 1 --branch release-al2 https://github.com/opengovsg/FormSG.git "$temp_base" --quiet

    find replacements -type f | while read replacement_file; do
        rel_path="${replacement_file#replacements/}"
        base_file="$temp_base/$rel_path"

        if [ -f "$base_file" ]; then
            echo "📄 $rel_path"
            echo "----------------------------------------"
            diff -u --color=always "$base_file" "$replacement_file" || true
            echo ""
        else
            echo "🆕 $rel_path (new file - not in base FormSG)"
            echo "----------------------------------------"
            cat "$replacement_file"
            echo ""
        fi
    done

# Sync changes from .formsg-base back to replacements/
sync:
    #!/bin/bash
    if [ ! -d ".formsg-base" ]; then
        echo "❌ Demo not set up. Run 'just setup' first."
        exit 1
    fi
    
    echo "🔄 Syncing changes from .formsg-base to replacements/..."
    
    # Find all modified files in .formsg-base and copy them back
    cd .formsg-base
    modified_files=$(git status --porcelain | grep -E "^ M|^M " | cut -c4-)
    
    if [ -z "$modified_files" ]; then
        echo "✅ No modified files found in .formsg-base"
        exit 0
    fi
    
    echo "📝 Found modified files:"
    echo "$modified_files"
    echo ""
    
    echo "$modified_files" | while read file; do
        if [ -n "$file" ]; then
            echo "📝 Syncing $file"
            mkdir -p "../replacements/$(dirname "$file")"
            cp "$file" "../replacements/$file"
        fi
    done
    
    echo ""
    echo "✅ Sync complete! Modified files copied to replacements/"

# Reset demo database (requires MongoDB connection)
reset-prod-db:
    mongosh -f bin/reset-db.mongodb.js
reset-prod-users:
    mongosh -f bin/reset-users.mongodb.js

help:
    @just --list
