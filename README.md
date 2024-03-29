﻿# Wirtualna uczelnia


## Wstęp
Celem pracy jest implementacja systemu "wirtualnej uczelni" pozwalającej na cyfryzacje obecnie istniejących systemów uczelni. Sam system może pełnić pewnego rodzaju "uzupełnienie" do systemów stacjonarnych, upraszczając ich obsługę.
Jednym ze systemów uczelni jest `dziekanat`, do którego ograniczony jest projekt na przedmiot `Testowanie i Jakość Oprogramowania II`

## Opis teoretyczny

Użytkownik **nie może sam założyć konta**. Sam proces zakładania konta odbywa się automatycznie w momencie dodania danej osoby do bazy danych przez administratora.


W systemie występuje podział użytkowników na role:

 - Administrator
 - Nauczyciel
 - Student

Każdy z użytkowników (oprócz administratora) posiada ograniczone uprawnienia do wyświetlania, dodawania bądź też aktualizacji danych.

Podstawowe funkcjonalności systemu (już zaimplementowane):

 - logowanie
 - operacje na zasobach (GET, POST, PUT, DELETE) dla różnych grup użytkowników:
	 - użytkowników
	 - ocen
	 - kierunków studiów
	 - przedmiotów
	 - wydziałów
## Diagram ERD
Niestety program z którego korzystano do wykonania diagramu ERD udostępnia tylko 
14-dniową darmową licencję, wobec tego diagram został wygenerowany bezpośrednio z narzędzia PgAdmin

![diagram ERD](/docs/erd.png)


## [Dokumentacja](https://app.swaggerhub.com/apis-docs/gothic459/wirtualna-uczelnia/1.0.0)
