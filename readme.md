NPM :

#npm init
#npm i

#node main.js 


Ajouter l'adresse IP du PC distant pour autoriser sa connection avec la DB :

1.
Mettre en commentaire la ligne 'bind-address = 127.0.0.1'
du fichier /etc/mysql/mariadb.conf.d/50-server.cnf
ainsi que décommenter le 'Port'

2.
Se connecter sur le PC qui hote le serveur mariaDB :
#mysql -u root

puis exécuter cette query :
GRANT ALL PRIVILEGES ON *.* TO root@my_ip IDENTIFIED BY ‘root_password‘ WITH GRANT OPTION;
my_ip à remplacer par l'ip du PC distant à connecter.

Pour voir les utilisateurs ainsi que leurs adresses IP autorisées à se connecter
USE mysql;
SELECT user,host FROM user;

commande à exécuter sur le pc distant :
#mysql -u root -p'motDePasse' -h addrIPDuServeurMySQL -P 3306




Changer de mot de passe d'un utilisateur voulant se connecter à la db mysql:
#mysql -u root -p

-> ALTER USER 'user-name'@'localhost' IDENTIFIED BY 'NEW_USER_PASSWORD';
-> FLUSH PRIVILEGES;


Lancer sur la raspbian le backend en mode 'production':
#./launch_script_production.sh &
(bien vérifier que le fichier est exécutable)

Sur la raspbian, voir les process en cours:
#ps au 
(voir le process id qui a comme 'COMMAND' 'node main.js')
#kill -9 <PID> 
(où PID vaut le pid du process node 'main.js')

Pour terminer un process qui utilise un certain port:
#fuser <port>/tcp
Puis, il donne le PID du process
