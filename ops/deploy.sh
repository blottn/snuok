DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ansible-playbook -v -i $DIR/inventory --become-method=sudo $DIR/main.yml
